document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const btnAsk = document.getElementById('btn-ask');

    // Fill input with example text when clicked
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            questionInput.value = text;
            questionInput.focus();
            
            // Scroll to ask section smoothly
            document.getElementById('ask').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Handle asking a question (visual feedback for now)
    btnAsk.addEventListener('click', () => {
        const query = questionInput.value.trim();
        if (query) {
            btnAsk.textContent = 'Pesquisando...';
            btnAsk.style.opacity = '0.7';
            
            // Redirect to chat page with the query
            window.location.href = `chat.html?q=${encodeURIComponent(query)}`;
        }
    });

    // Handle Enter key in input
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnAsk.click();
        }
    });
});
