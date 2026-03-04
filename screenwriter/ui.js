const UI = (() => {
    const init = () => {
        // Sidebar Toggle
        document.getElementById('btn-sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('hidden');
        });

        // Focus Mode
        document.getElementById('btn-focus').addEventListener('click', () => {
            document.body.classList.toggle('focus-mode');
        });

        // Tabs
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Update active tab button
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${target}`).classList.add('active');
            });
        });

        // Modal close on overlay click or cancel
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') hideModal();
        });
        document.getElementById('modal-cancel').addEventListener('click', hideModal);
    };

    const showModal = (title, bodyHtml, onOk) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;

        const okBtn = document.getElementById('modal-ok');
        // Clear previous listeners
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newOkBtn.addEventListener('click', () => {
            if (onOk) onOk();
            hideModal();
        });

        document.getElementById('modal-overlay').classList.remove('hidden');
    };

    const hideModal = () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    };

    const updateSyncStatus = (status) => {
        document.getElementById('sync-status').textContent = status;
    };

    const updateScriptTitle = (title) => {
        document.getElementById('script-title').textContent = title;
    };

    return {
        init,
        showModal,
        hideModal,
        updateSyncStatus,
        updateScriptTitle
    };
})();
