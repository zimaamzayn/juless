const Stats = (() => {
    let statsContainer;

    const init = () => {
        statsContainer = document.getElementById('stats-container');
    };

    const update = (contentHtml) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const text = tempDiv.textContent || "";

        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sceneCount = tempDiv.querySelectorAll('.element.scene-heading').length;
        const dialogueCount = tempDiv.querySelectorAll('.element.dialogue').length;

        // Character detection
        const characterElements = tempDiv.querySelectorAll('.element.character');
        const characters = {};
        characterElements.forEach(el => {
            const name = el.textContent.trim().toUpperCase();
            if (name) {
                characters[name] = (characters[name] || 0) + 1;
            }
        });

        // Update Status Bar
        document.getElementById('stat-words').textContent = `Words: ${wordCount}`;

        // Estimate page count (very rough: 1 page ~= 250 words)
        const pageCount = Math.max(1, Math.ceil(wordCount / 250));
        document.getElementById('stat-page').textContent = `Page ${pageCount}`;

        // Update Stats Tab
        let charHtml = '<ul>';
        Object.keys(characters).sort((a,b) => characters[b] - characters[a]).forEach(name => {
            charHtml += `<li>${name}: ${characters[name]} lines</li>`;
        });
        charHtml += '</ul>';

        statsContainer.innerHTML = `
            <div class="stat-group">
                <h3>General</h3>
                <p>Scenes: ${sceneCount}</p>
                <p>Dialogue Lines: ${dialogueCount}</p>
                <p>Word Count: ${wordCount}</p>
                <p>Estimated Runtime: ${pageCount} min</p>
            </div>
            <div class="stat-group">
                <h3>Characters</h3>
                ${charHtml}
            </div>
        `;
    };

    return {
        init,
        update
    };
})();
