const Editor = (() => {
    let editorEl;
    let onChangeCallback = null;
    let suggestionEl = null;

    const init = (el, onChange) => {
        editorEl = el;
        onChangeCallback = onChange;

        editorEl.addEventListener('keydown', handleKeyDown);
        editorEl.addEventListener('input', handleInput);
        editorEl.addEventListener('click', () => {
            updateStatusBar();
            hideSuggestions();
        });
        editorEl.addEventListener('keyup', updateStatusBar);

        // Create suggestion element
        suggestionEl = document.createElement('div');
        suggestionEl.id = 'editor-suggestions';
        suggestionEl.className = 'hidden';
        document.body.appendChild(suggestionEl);
    };

    const handleKeyDown = (e) => {
        if (suggestionEl && !suggestionEl.classList.contains('hidden')) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveSuggestionFocus(1);
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveSuggestionFocus(-1);
                return;
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                const focused = suggestionEl.querySelector('.focused');
                if (focused) {
                    e.preventDefault();
                    focused.click();
                    return;
                }
            } else if (e.key === 'Escape') {
                hideSuggestions();
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnterKey();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabKey(e.shiftKey);
        }
    };

    const handleInput = (e) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const currentElement = getParentElement(range.startContainer);

        if (currentElement) {
            // Automatic Parentheses for Parentheticals
            if (currentElement.dataset.type === ScreenplayEngine.ELEMENT_TYPES.PARENTHETICAL) {
                let text = currentElement.textContent;
                if (!text.startsWith('(') && text.length > 0) {
                    currentElement.textContent = '(' + text + (text.endsWith(')') ? '' : ')');
                    moveCursorToIndex(currentElement, 1);
                }
            }

            // Show suggestions
            showSuggestionsFor(currentElement);
        }

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

        // Cleanup Parenthetical before leaving
        if (currentType === ScreenplayEngine.ELEMENT_TYPES.PARENTHETICAL) {
            let text = currentElement.textContent.trim();
            if (!text.endsWith(')')) currentElement.textContent = text + ')';
        }

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

        hideSuggestions();
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

        if (type === ScreenplayEngine.ELEMENT_TYPES.PARENTHETICAL) {
            if (!el.textContent.startsWith('(')) el.textContent = '(' + el.textContent;
            if (!el.textContent.endsWith(')')) el.textContent = el.textContent + ')';
        }

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

    const moveCursorToEnd = (el) => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(el, el.childNodes.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const moveCursorToIndex = (el, index) => {
        const range = document.createRange();
        const selection = window.getSelection();
        if (el.childNodes[0]) {
            range.setStart(el.childNodes[0], index);
        } else {
            range.setStart(el, 0);
        }
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const showSuggestionsFor = (el) => {
        const type = el.dataset.type;
        const text = el.textContent.trim().toUpperCase();
        if (text === "") {
            hideSuggestions();
            return;
        }
        const suggestions = ScreenplayEngine.getSuggestions(type, text, editorEl.innerHTML);

        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }

        suggestionEl.innerHTML = '';
        suggestions.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item' + (i === 0 ? ' focused' : '');
            item.textContent = s;
            item.addEventListener('click', () => {
                el.textContent = s;
                hideSuggestions();
                moveCursorToEnd(el);
                if (onChangeCallback) onChangeCallback();
            });
            suggestionEl.appendChild(item);
        });

        const rect = el.getBoundingClientRect();
        suggestionEl.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionEl.style.left = `${rect.left + window.scrollX}px`;
        suggestionEl.classList.remove('hidden');
    };

    const hideSuggestions = () => {
        if (suggestionEl) suggestionEl.classList.add('hidden');
    };

    const moveSuggestionFocus = (dir) => {
        const items = suggestionEl.querySelectorAll('.suggestion-item');
        let index = Array.from(items).findIndex(item => item.classList.contains('focused'));
        items[index].classList.remove('focused');
        index = (index + dir + items.length) % items.length;
        items[index].classList.add('focused');
        items[index].scrollIntoView({ block: 'nearest' });
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
