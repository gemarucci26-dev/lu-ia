document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const btnAttach = document.getElementById('btn-attach');
    const fileInput = document.getElementById('file-input');
    const filePreviewArea = document.getElementById('file-preview-area');
    const btnMic = document.getElementById('btn-mic');
    const sidebar = document.getElementById('sidebar');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnNewChat = document.getElementById('btn-new-chat');
    const chatList = document.getElementById('chat-list');

    const btnTheme = document.getElementById('theme-toggle');

    // Theme Management
    const currentTheme = localStorage.getItem('lulu_theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const newTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('lulu_theme', newTheme);
        });
    }

    // State
    let currentChatId = null;
    let chats = JSON.parse(localStorage.getItem('lulu_chats')) || {};
    let pendingFiles = []; // Array of { file, base64, mimeType }
    let mediaRecorder = null;
    let audioChunks = [];

    // Initialize
    init();

    function init() {
        renderSidebar();
        
        // Check URL for initial query
        const urlParams = new URLSearchParams(window.location.search);
        const initialQuery = urlParams.get('q');
        
        if (initialQuery) {
            createNewChat();
            processMessage(initialQuery);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Load most recent or create new
            const chatIds = Object.keys(chats).sort((a,b) => b - a);
            if (chatIds.length > 0) {
                loadChat(chatIds[0]);
            } else {
                createNewChat();
            }
        }
    }

    // Sidebar & History Logic
    function createNewChat() {
        currentChatId = Date.now().toString();
        chats[currentChatId] = {
            id: currentChatId,
            title: 'Nova Conversa',
            messages: []
        };
        saveChats();
        renderSidebar();
        chatContainer.innerHTML = '';
        addMessage('Olá! Como posso te ajudar hoje?', 'bot', false);
    }

    function loadChat(chatId) {
        currentChatId = chatId;
        chatContainer.innerHTML = '';
        renderSidebar();
        
        const chat = chats[chatId];
        if (chat.messages.length === 0) {
            addMessage('Olá! Como posso te ajudar hoje?', 'bot', false);
        } else {
            chat.messages.forEach(msg => {
                addMessage(msg.text, msg.sender, false, msg.files);
            });
        }
        scrollToBottom();
    }

    function saveChats() {
        localStorage.setItem('lulu_chats', JSON.stringify(chats));
    }

    function renderSidebar() {
        chatList.innerHTML = '';
        const sortedIds = Object.keys(chats).sort((a, b) => b - a);
        
        sortedIds.forEach(id => {
            const chat = chats[id];
            
            const wrapper = document.createElement('div');
            wrapper.className = `chat-item-wrapper ${id === currentChatId ? 'active' : ''}`;

            const btn = document.createElement('button');
            btn.className = 'chat-item';
            btn.textContent = chat.title;
            btn.onclick = () => loadChat(id);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete-chat';
            deleteBtn.title = 'Excluir Conversa';
            deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir permanentemente esta conversa?')) {
                    delete chats[id];
                    saveChats();
                    if (id === currentChatId) {
                        const remaining = Object.keys(chats).sort((a,b) => b - a);
                        if (remaining.length > 0) loadChat(remaining[0]);
                        else createNewChat();
                    } else {
                        renderSidebar();
                    }
                }
            };

            wrapper.appendChild(btn);
            wrapper.appendChild(deleteBtn);
            chatList.appendChild(wrapper);
        });
    }

    function updateChatTitle(text) {
        const chat = chats[currentChatId];
        if (chat.title === 'Nova Conversa') {
            chat.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            saveChats();
            renderSidebar();
        }
    }

    // UI Logic
    function addMessage(text, sender, save = true, files = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = sender === 'user' ? 'Você' : 'Lulu-IA';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        if (sender === 'bot' && typeof marked !== 'undefined') {
            bubble.innerHTML = marked.parse(text || '');
        } else {
            bubble.textContent = text || '';
        }

        // Add attachments visually
        if (files && files.length > 0) {
            files.forEach(f => {
                if (f.mimeType.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = `data:${f.mimeType};base64,${f.base64}`;
                    img.className = 'message-img';
                    bubble.appendChild(img);
                } else if (f.mimeType.startsWith('audio/')) {
                    const audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = `data:${f.mimeType};base64,${f.base64}`;
                    audio.className = 'message-audio';
                    bubble.appendChild(audio);
                } else {
                    const docInfo = document.createElement('div');
                    docInfo.textContent = `📎 Arquivo Anexado`;
                    docInfo.style.fontStyle = 'italic';
                    docInfo.style.marginTop = '0.5rem';
                    bubble.appendChild(docInfo);
                }
            });
        }

        messageDiv.appendChild(label);
        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);
        
        if (save) {
            chats[currentChatId].messages.push({ text, sender, files });
            saveChats();
        }
        
        scrollToBottom();
        return messageDiv;
    }

    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot typing';
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = 'Lulu-IA está pensando...';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';

        bubble.appendChild(indicator);
        messageDiv.appendChild(label);
        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);
        
        scrollToBottom();
        return messageDiv;
    }

    // Process Message
    async function processMessage(text, filesToSend = []) {
        if (!text.trim() && filesToSend.length === 0) return;

        updateChatTitle(text || "Áudio/Arquivo enviado");
        addMessage(text, 'user', true, filesToSend);

        const typingDiv = addTypingIndicator();

        // Prepare History for API
        const history = chats[currentChatId].messages.slice(0, -1).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: text,
                    files: filesToSend,
                    history: history
                })
            });

            const data = await response.json();
            typingDiv.remove();

            if (response.ok) {
                addMessage(data.response, 'bot');
            } else {
                addMessage(`Ocorreu um erro: ${data.error}`, 'bot');
            }
        } catch (error) {
            typingDiv.remove();
            addMessage('Desculpe, ocorreu um erro de conexão. Tente novamente mais tarde.', 'bot');
        }
    }

    function scrollToBottom() {
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
        }, 50);
    }

    // Multimodal & File Handling
    btnAttach.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (let file of files) {
            if (file.size > 4 * 1024 * 1024) {
                alert(`O arquivo ${file.name} é muito grande (Máx: 4MB).`);
                continue;
            }
            const base64 = await fileToBase64(file);
            pendingFiles.push({ file, base64, mimeType: file.type });
            renderFilePreviews();
        }
        fileInput.value = '';
    });

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    function renderFilePreviews() {
        filePreviewArea.innerHTML = '';
        pendingFiles.forEach((p, index) => {
            const badge = document.createElement('div');
            badge.className = 'file-badge';
            badge.textContent = p.file.name ? (p.file.name.substring(0, 15) + '...') : 'Áudio gravado';
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.onclick = () => {
                pendingFiles.splice(index, 1);
                renderFilePreviews();
            };
            
            badge.appendChild(removeBtn);
            filePreviewArea.appendChild(badge);
        });
    }

    // Audio Recording
    btnMic.addEventListener('mousedown', startRecording);
    btnMic.addEventListener('mouseup', stopRecording);
    btnMic.addEventListener('touchstart', startRecording);
    btnMic.addEventListener('touchend', stopRecording);

    async function startRecording(e) {
        e.preventDefault();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const base64 = await fileToBase64(audioBlob);
                pendingFiles.push({ file: { name: 'audio_message.webm' }, base64, mimeType: 'audio/webm' });
                renderFilePreviews();
                
                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.start();
            btnMic.classList.add('recording');
        } catch (err) {
            alert('Não foi possível acessar o microfone.');
        }
    }

    function stopRecording(e) {
        e.preventDefault();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            btnMic.classList.remove('recording');
        }
    }

    // Event Listeners for UI
    btnToggleSidebar.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    btnNewChat.addEventListener('click', createNewChat);

    btnSend.addEventListener('click', () => {
        const text = chatInput.value;
        const filesToSend = [...pendingFiles];
        
        chatInput.value = '';
        pendingFiles = [];
        renderFilePreviews();
        
        processMessage(text, filesToSend);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnSend.click();
        }
    });
});
