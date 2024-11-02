declare namespace _default {
  export { setupSlider };
  export { makeSlider };
  export { makeCheckbox };
  export { makeOption };
  export { setupUI };
  export { updateUI };
  export { getQueryParams };
}
export default _default;
declare function setupSlider(selector: string, options: any): {
  elem: any;
  updateValue: (v: any) => void;
};
declare function makeSlider(options: any): {
  elem: any;
  updateValue: (v: any) => void;
};
declare function makeCheckbox(options: any): {
  elem: HTMLDivElement;
  updateValue: (v: any) => void;
};
declare function makeOption(options: any): {
  elem: HTMLDivElement;
  updateValue: (v: any) => void;
};
declare function setupUI(parent: any, object: any, uiInfos: any): {};
declare function updateUI(widgets: any, data: any): void;
declare function getQueryParams(): {};
//# sourceMappingURL=webgl-lessons-ui.d.ts.map