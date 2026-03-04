const Navigator = (() => {
    let sceneListEl;

    const init = () => {
        sceneListEl = document.getElementById('scene-list');
    };

    const update = (contentHtml) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const elements = tempDiv.querySelectorAll('.element.scene-heading');

        sceneListEl.innerHTML = '';
        elements.forEach((el, index) => {
            const item = document.createElement('div');
            item.className = 'scene-item';
            item.textContent = `${index + 1}. ${el.textContent}`;
            item.addEventListener('click', () => jumpToScene(index));
            sceneListEl.appendChild(item);
        });
    };

    const jumpToScene = (index) => {
        const scenes = document.querySelectorAll('.element.scene-heading');
        if (scenes[index]) {
            scenes[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus and set cursor
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(scenes[index], 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            scenes[index].focus();
        }
    };

    return {
        init,
        update
    };
})();
