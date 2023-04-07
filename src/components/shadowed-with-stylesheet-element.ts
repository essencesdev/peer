export class ShadowedWithStylesheetElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		const styleSheet = document.createElement("link");
		styleSheet.rel = "stylesheet";
		styleSheet.href = "/colors.css";
		this.shadowRoot!.appendChild(styleSheet);

		const styleSheet2 = document.createElement("link");
		styleSheet2.rel = "stylesheet";
		styleSheet2.href = "components/components-shared.css";
		this.shadowRoot!.appendChild(styleSheet2);
	}
}
