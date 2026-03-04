const ScreenplayEngine = (() => {
    const ELEMENT_TYPES = {
        SCENE_HEADING: 'scene-heading',
        ACTION: 'action',
        CHARACTER: 'character',
        DIALOGUE: 'dialogue',
        PARENTHETICAL: 'parenthetical',
        TRANSITION: 'transition',
        SHOT: 'shot'
    };

    const ELEMENT_ORDER = [
        ELEMENT_TYPES.SCENE_HEADING,
        ELEMENT_TYPES.ACTION,
        ELEMENT_TYPES.CHARACTER,
        ELEMENT_TYPES.DIALOGUE,
        ELEMENT_TYPES.PARENTHETICAL,
        ELEMENT_TYPES.TRANSITION,
        ELEMENT_TYPES.SHOT
    ];

    const getNextType = (currentType) => {
        switch (currentType) {
            case ELEMENT_TYPES.ACTION:
                return ELEMENT_TYPES.CHARACTER;
            case ELEMENT_TYPES.CHARACTER:
                return ELEMENT_TYPES.DIALOGUE;
            case ELEMENT_TYPES.DIALOGUE:
                return ELEMENT_TYPES.ACTION;
            case ELEMENT_TYPES.SCENE_HEADING:
                return ELEMENT_TYPES.ACTION;
            case ELEMENT_TYPES.PARENTHETICAL:
                return ELEMENT_TYPES.DIALOGUE;
            case ELEMENT_TYPES.TRANSITION:
                return ELEMENT_TYPES.SCENE_HEADING;
            default:
                return ELEMENT_TYPES.ACTION;
        }
    };

    const cycleType = (currentType) => {
        const index = ELEMENT_ORDER.indexOf(currentType);
        const nextIndex = (index + 1) % ELEMENT_ORDER.length;
        return ELEMENT_ORDER[nextIndex];
    };

    const identifyType = (text) => {
        const trimmed = text.trim().toUpperCase();

        if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.') || trimmed.startsWith('I/E')) {
            return ELEMENT_TYPES.SCENE_HEADING;
        }

        if (trimmed.endsWith(':') && (trimmed.includes('CUT TO') || trimmed.includes('FADE '))) {
            return ELEMENT_TYPES.TRANSITION;
        }

        return null;
    };

    const getSuggestions = (type, text, contentHtml) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const query = text.toUpperCase();

        if (type === ELEMENT_TYPES.SCENE_HEADING) {
            const prefixes = ['INT.', 'EXT.', 'INT/EXT.', 'I/E.'];
            const headings = Array.from(tempDiv.querySelectorAll('.scene-heading'))
                .map(el => el.textContent.trim().toUpperCase());

            const all = [...prefixes, ...headings];
            return [...new Set(all)].filter(h => h.startsWith(query) && h !== query);
        }

        if (type === ELEMENT_TYPES.CHARACTER) {
            const names = Array.from(tempDiv.querySelectorAll('.character'))
                .map(el => el.textContent.trim().toUpperCase());
            return [...new Set(names)].filter(n => n.startsWith(query) && n !== query);
        }

        return [];
    };

    return {
        ELEMENT_TYPES,
        getNextType,
        cycleType,
        identifyType,
        getSuggestions
    };
})();
