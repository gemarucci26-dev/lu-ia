document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');

    // Get the initial query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');

    if (initialQuery) {
        processMessage(initialQuery);
        // Clear the URL to avoid resubmitting on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = sender === 'user' ? 'Você' : 'LuIA';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;

        messageDiv.appendChild(label);
        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);
        
        scrollToBottom();
        return messageDiv;
    }

    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot typing';
        
        const label = document.createElement('div');
        label.className = 'message-label';
        label.textContent = 'LuIA está pesquisando...';

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

    async function processMessage(text) {
        if (!text.trim()) return;

        // Add User Message
        addMessage(text, 'user');

        // Add Typing Indicator
        const typingDiv = addTypingIndicator();

        try {
            // Call our new Serverless Backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: text })
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
            console.error('Fetch error:', error);
        }
    }

    function scrollToBottom() {
        // Use timeout to ensure DOM is updated before scrolling
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    }



    // Event Listeners for new messages
    btnSend.addEventListener('click', () => {
        const text = chatInput.value;
        chatInput.value = '';
        processMessage(text);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnSend.click();
        }
    });
});
