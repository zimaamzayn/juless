const Shortcuts = (() => {
    const init = () => {
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.SCENE_HEADING);
                        break;
                    case '2':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.ACTION);
                        break;
                    case '3':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.CHARACTER);
                        break;
                    case '4':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.DIALOGUE);
                        break;
                    case '5':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.PARENTHETICAL);
                        break;
                    case '6':
                        e.preventDefault();
                        applyType(ScreenplayEngine.ELEMENT_TYPES.TRANSITION);
                        break;
                    case 's':
                        e.preventDefault();
                        // Save is handled by autosave but manual save is good
                        App.saveCurrentScript();
                        break;
                }
            }
        });
    };

    const applyType = (type) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        let curr = selection.getRangeAt(0).startContainer;
        while (curr && curr.id !== 'editor') {
            if (curr.classList && curr.classList.contains('element')) {
                Editor.setElementType(curr, type);
                break;
            }
            curr = curr.parentNode;
        }
    };

    return {
        init
    };
})();
