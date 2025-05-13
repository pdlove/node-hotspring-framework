class uiMenu {
    parentDOM = null;
    clientPackage = null;
    #flatData = null;
    #treeData = null;
    selectedItem = null;
    
    panel = null; //The client panel DOM object
    
    constructor(menuData) {
        if (menuData)
            this.loadData(menuData);
    };

    async setParameters(parameters) {
        if (!parameters) return;
        if (!parameters.menuData)
            parameters.menuData = (await API.getAPIData('system/menu/'));
        this.loadData(parameters.menuData);
        
        if (parameters.panel)
            this.panel = parameters.panel;
    }

    async renderDOM(destDOM) {
        destDOM.innerHTML='';
        this.renderHTML(destDOM);
    }

    loadData(menuData) {
        this.#flatData={};
        this.addData(menuData)
    }

    addData(menuData) {
        for (var idx in menuData) {
            var newMenuItem = new uiMenuItem(menuData[idx]); 
            newMenuItem.inMenu = this; //This is so that the menu item can toggle the currently effective item.
            this.#flatData[newMenuItem.menuID]=newMenuItem;
        }                
        this.#parseTreeFromFlat();
    }

    #parseTreeFromFlat() {
        this.#treeData=[];
        //Clear out the children and parent references.
        for (let idx in this.#flatData) {        
            this.#flatData[idx].children=[]; //Get the item
        }
        for (let idx in this.#flatData) {        
            var menuItem = this.#flatData[idx]; //Get the item
            var parentItem = this.#flatData[menuItem.parent_menu_id]; //Get the parent
            
            if (parentItem) { //If there is a parent
                if (!parentItem.children) parentItem.children=[]; //Create Child Array If Needed
                parentItem.children.push(menuItem);
                menuItem.parent=parentItem;
                menuItem.isRoot=false;
            } else {
                this.#treeData.push(menuItem);
                menuItem.parent=null;
                menuItem.isRoot=true;
            }            
        }
        return;
    }
    renderHTML(destTag) {        
        // let renderedMenu = this.clientPackage.templates['uiMenuTemplate']({ menuItems: this.#treeData });
        // destTag.innerHTML=renderedMenu;
        // return renderedMenu;
        let rootMenu = document.createElement("ul");
        for (var idx in this.#treeData)
				rootMenu.appendChild(this.#treeData[idx].renderItem());

        if (destTag) this.parentDOM = destTag;
        if (this.parentDOM) {
            // Remove the first child if it exists
            if (this.parentDOM.firstChild) {
                this.parentDOM.replaceChild(rootMenu, this.parentDOM.firstChild);
            } else {
                this.parentDOM.appendChild(rootMenu);
            }
        }
		return rootMenu;		
    }
    setSelectedItem(id, performAction=true) {
        //Clear the flag on the selected item and all parents.
        let workItem = this.selectedItem || {};
        while (workItem) {
            workItem.isSelected=false;
            if (workItem.domLI) {
                workItem.domLI.classList.remove("active");
                workItem.domLI.classList.remove("activetick");
                if (workItem.domLink.children.length>0) workItem.domLink.classList.add("collapsed");
            }
            workItem=workItem.parent;
        }

        //Set the flag on the new one and all parents
        this.selectedItem = this.#flatData[id];
        workItem = this.selectedItem;
        if (workItem && workItem.domLI) workItem.domLI.classList.add("activetick"); //Only the actually selected item gets the tick.
        while (workItem) {
            workItem.isSelected=true;
            if (workItem && workItem.domLI) {
                workItem.domLI.classList.add("active");
                workItem.domLink.classList.remove("collapsed");
            }
            workItem=workItem.parent;
        }
        if (performAction) {
            if (this.selectedItem && this.selectedItem.executeMenu) //If the item has an action, perform it.
                this.selectedItem.executeMenu();
        }
    }

}
