const Storage = (() => {
    const DB_NAME = 'ScreenWriterDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'scripts';
    let db = null;

    const init = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error: " + event.target.errorCode);
                reject(event.target.errorCode);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    objectStore.createIndex('lastModified', 'lastModified', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
        });
    };

    const getAllScripts = () => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const getScript = (id) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const saveScript = (script) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            script.lastModified = Date.now();
            const request = store.put(script);

            request.onsuccess = () => resolve(script);
            request.onerror = () => reject(request.error);
        });
    };

    const deleteScript = (id) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    };

    const createNewScript = (title = "Untitled Script") => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const now = Date.now();
        const newScript = {
            id,
            title,
            content: `<div class="element scene-heading" data-type="scene-heading">INT. NEW SCENE - DAY</div><div class="element action" data-type="action">Begin writing...</div>`,
            createdAt: now,
            lastModified: now,
            metadata: {}
        };
        return saveScript(newScript);
    };

    const getLastModifiedScript = async () => {
        const scripts = await getAllScripts();
        if (scripts.length === 0) return null;
        return scripts.sort((a, b) => b.lastModified - a.lastModified)[0];
    };

    return {
        init,
        getAllScripts,
        getScript,
        saveScript,
        deleteScript,
        createNewScript,
        getLastModifiedScript
    };
})();
