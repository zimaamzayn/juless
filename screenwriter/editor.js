const Editor = (() => {
    let editorEl;
    let onChangeCallback = null;

    const init = (el, onChange) => {
        editorEl = el;
        onChangeCallback = onChange;

        editorEl.addEventListener('keydown', handleKeyDown);
        editorEl.addEventListener('input', handleInput);
        editorEl.addEventListener('click', updateStatusBar);
        editorEl.addEventListener('keyup', updateStatusBar);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnterKey();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabKey(e.shiftKey);
        }
    };

    const handleInput = (e) => {
        if (onChangeCallback) onChangeCallback();
        updateStatusBar();
    };

    const handleEnterKey = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const currentElement = getParentElement(range.startContainer);

        if (!currentElement) return;

        const currentType = currentElement.dataset.type;
        const nextType = ScreenplayEngine.getNextType(currentType);

        // Split text if cursor is in middle
        const postTextRange = range.cloneRange();
        postTextRange.selectNodeContents(currentElement);
        postTextRange.setStart(range.endContainer, range.endOffset);
        const postTextContent = postTextRange.extractContents();

        const newElement = document.createElement('div');
        newElement.className = `element ${nextType}`;
        newElement.dataset.type = nextType;

        if (postTextContent.textContent.trim() === "") {
            newElement.innerHTML = '<br>';
        } else {
            newElement.appendChild(postTextContent);
        }

        currentElement.after(newElement);

        // Move cursor to new element
        const newRange = document.createRange();
        newRange.setStart(newElement, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        if (onChangeCallback) onChangeCallback();
    };

    const handleTabKey = (isShift) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const currentElement = getParentElement(range.startContainer);

        if (!currentElement) return;

        const currentType = currentElement.dataset.type;
        const nextType = ScreenplayEngine.cycleType(currentType);

        setElementType(currentElement, nextType);
    };

    const setElementType = (el, type) => {
        el.className = `element ${type}`;
        el.dataset.type = type;
        updateStatusBar();
        if (onChangeCallback) onChangeCallback();
    };

    const getParentElement = (node) => {
        let curr = node;
        while (curr && curr !== editorEl) {
            if (curr.classList && curr.classList.contains('element')) {
                return curr;
            }
            curr = curr.parentNode;
        }
        return null;
    };

    const updateStatusBar = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const currentElement = getParentElement(selection.getRangeAt(0).startContainer);
        if (currentElement) {
            const type = currentElement.dataset.type;
            document.getElementById('current-element-type').textContent = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
        }
    };

    const getContent = () => editorEl.innerHTML;
    const setContent = (html) => {
        editorEl.innerHTML = html;
        updateStatusBar();
    };

    return {
        init,
        getContent,
        setContent,
        setElementType
    };
})();
