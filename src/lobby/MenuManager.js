export class MenuManager {
    constructor() {
        this.menus = {
            main: document.getElementById('menu-main'),
            campaign: document.getElementById('menu-campaign'),
            singleplayer: document.getElementById('menu-single'),
            multiplayer: document.getElementById('menu-multi'),
            settings: document.getElementById('menu-settings')
        };
        
        this.bindEvents();
        this.checkTutorial();
    }

    bindEvents() {
        // Main Menu Buttons
        document.getElementById('btn-campaign').addEventListener('click', () => this.navigateTo('campaign'));
        document.getElementById('btn-singleplayer').addEventListener('click', () => this.navigateTo('singleplayer'));
        document.getElementById('btn-multiplayer').addEventListener('click', () => this.navigateTo('multiplayer'));
        document.getElementById('btn-settings').addEventListener('click', () => this.navigateTo('settings'));

        // Generic Back Buttons for all submenus
        const backButtons = document.querySelectorAll('.btn-back');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo('main'));
        });
        
        // Tutorial Modal Close
        const closeTutorialBtn = document.getElementById('btn-close-tutorial');
        if (closeTutorialBtn) {
            closeTutorialBtn.addEventListener('click', () => {
                document.getElementById('tutorial-modal').style.display = 'none';
                // Remove the query parameter from the URL to prevent looping
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
        
        // Play click sound (Placeholder logic)
        const allButtons = document.querySelectorAll('.menu-btn');
        allButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => this.playHoverSound());
            btn.addEventListener('click', () => this.playClickSound());
        });
    }

    navigateTo(menuId) {
        console.log(`Navigating to: ${menuId}`);
        
        // Hide all menus
        Object.values(this.menus).forEach(menu => {
            if (menu) {
                menu.classList.remove('active');
                menu.style.display = 'none';
            }
        });

        // Show target menu
        const targetMenu = this.menus[menuId];
        if (targetMenu) {
            targetMenu.style.display = 'flex';
            // Use setTimeout to allow display:block to apply before adding class for CSS fade-in
            setTimeout(() => targetMenu.classList.add('active'), 10);
        }
    }
    
    playHoverSound() {
        // TODO: Implement actual Audio object play
        // console.log("bloop");
    }
    
    playClickSound() {
         // TODO: Implement actual Audio object play
         // console.log("click");
    }

    checkTutorial() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('tutorial') === 'true') {
            const tutorialModal = document.getElementById('tutorial-modal');
            if (tutorialModal) {
                tutorialModal.style.display = 'flex';
                // Pre-navigate to campaign menu underneath
                this.navigateTo('campaign');
            }
        }
    }
}
