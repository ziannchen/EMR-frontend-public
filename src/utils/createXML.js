class CreatXmlDoc {
	constructor(obj) {
		this.tagName = obj.tagName;
		var children = obj.children.map(function (item) {
			if (typeof item == "object") {
				item = new CreatXmlDoc(item);
			}
			return item;
		});
		this.children = children;
	}
	render() {
		var el = document.createElement(this.tagName);
		var children = this.children || [];
		children.forEach(function (child) {
			var childEl =
				child instanceof CreatXmlDoc
					? child.render()
					: document.createTextNode(child);
			el.appendChild(childEl);
		});
		return el;
	}
}

export default CreatXmlDoc;
