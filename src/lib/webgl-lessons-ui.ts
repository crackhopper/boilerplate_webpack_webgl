const gopt = getQueryParams();

export interface ISliderOption {
  name?: string;
  precision?: number;
  min?: number;
  step?: number;
  value?: number;
  max?: number;
  slide?: ISliderFunction;
  uiPrecision?: number;
  uiMult?: number;
}
export interface ISliderFunction {
  (event: InputEvent, uiInfo: { value: number }): void;
}
export function setupSlider(selector: string, option: ISliderOption) {
  var parent = document.querySelector(selector);
  if (!parent) {
    // like jquery don't fail on a bad selector
    return;
  }
  if (!option.name) {
    option.name = selector.substring(1);
  }
  return createSlider(parent, option); // eslint-disable-line
}

export function createSlider(parent: Element, option: ISliderOption) {
  var precision = option.precision || 0;
  var min = option.min || 0;
  var step = option.step || 1;
  var value = option.value || 0;
  var max = option.max || 1;
  var fn = option.slide;
  var name = gopt["ui-" + option.name] || option.name;
  var uiPrecision = option.uiPrecision === undefined ? precision : option.uiPrecision;
  var uiMult = option.uiMult || 1;

  min /= step;
  max /= step;
  value /= step;

  parent.innerHTML = `
    <div class="gman-widget-outer">
      <div class="gman-widget-label">${name}</div>
      <div class="gman-widget-value"></div>
      <input class="gman-widget-slider" type="range" min="${min}" max="${max}" value="${value}" />
    </div>
  `;
  var valueElem = parent.querySelector(".gman-widget-value");
  var sliderElem: HTMLInputElement = parent.querySelector(".gman-widget-slider");

  function updateValue(value: number) {
    valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
  }

  updateValue(value);

  function handleChange(event: InputEvent) {
    // @ts-ignore
    var value = parseInt(event.target.value);
    updateValue(value);
    fn(event, { value: value * step });
  }

  sliderElem.addEventListener('input', handleChange);
  sliderElem.addEventListener('change', handleChange);

  return {
    elem: parent as HTMLDivElement,
    updateValue: (v: number) => {
      v /= step;
      sliderElem.value = v.toString();
      updateValue(v);
    },
  };
}

export function makeSlider(options: ISliderOption) {
  const div = document.createElement("div");
  return createSlider(div, options);
}

var widgetId = 0;
export function getWidgetId() {
  return "__widget_" + widgetId++;
}

export interface ICheckboxOption {
  name: string;
  value: boolean;
  change: ICheckboxFunction;
}
export interface ICheckboxFunction {
  (event: Event, uiInfo: { value: boolean }): void;
}

export function makeCheckbox(option: ICheckboxOption) {
  const div = document.createElement("div");
  div.className = "gman-widget-outer";
  const label = document.createElement("label");
  const id = getWidgetId();
  label.setAttribute('for', id);
  label.textContent = gopt["ui-" + option.name] || option.name;
  label.className = "gman-checkbox-label";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = option.value;
  input.id = id;
  input.className = "gman-widget-checkbox";
  div.appendChild(label);
  div.appendChild(input);
  input.addEventListener('change', function (e) {
    option.change(e, {
      // @ts-ignore
      value: e.target.checked,
    });
  });

  return {
    elem: div,
    updateValue: function (v: number) {
      input.checked = !!v;
    },
  };
}

export interface IOptionOption {
  name: string;
  value: number;
  options: string[];
  change: IOptionChangeFunction;
}

export interface IOptionChangeFunction {
  (event: Event, uiInfo: { value: number }): void;
}

export function makeOption(options: IOptionOption) {
  const div = document.createElement("div");
  div.className = "gman-widget-outer";
  const label = document.createElement("label");
  const id = getWidgetId();
  label.setAttribute('for', id);
  label.textContent = gopt["ui-" + options.name] || options.name;
  label.className = "gman-widget-label";
  const selectElem = document.createElement("select");
  options.options.forEach((name, ndx) => {
    const opt = document.createElement("option");
    opt.textContent = gopt["ui-" + name] || name;
    opt.value = ndx.toString();
    opt.selected = ndx === options.value;
    selectElem.appendChild(opt);
  });
  selectElem.className = "gman-widget-select";
  div.appendChild(label);
  div.appendChild(selectElem);
  selectElem.addEventListener('change', function (e) {
    options.change(e, {
      value: selectElem.selectedIndex,
    });
  });

  return {
    elem: div,
    updateValue: function (v: number) {
      selectElem.selectedIndex = v;
    },
  };
}

function noop() {
}

export interface IGenSliderOption extends ISliderOption {
  key: string;
  changeCallback: () => void;
}

function genSlider(object: any, ui: IGenSliderOption) {
  const changeFn = ui.changeCallback || noop;
  ui.name = ui.name || ui.key;
  ui.value = object[ui.key];
  ui.slide = ui.slide || function (event, uiInfo) {
    object[ui.key] = uiInfo.value;
    changeFn();
  };
  return makeSlider(ui);
}

export interface IGenCheckboxOption extends ICheckboxOption {
  key: string;
  changeCallback: () => void;
}
export function genCheckbox(object: any, ui: IGenCheckboxOption) {
  ui.value = object[ui.key];
  ui.name = ui.name || ui.key;
  if (!ui.change) {
    const changeFn = ui.changeCallback || noop;
    ui.change = function (event, uiInfo) {
      object[ui.key] = uiInfo.value;
      changeFn();
    };
  }
  return makeCheckbox(ui);
}

export interface IGenOptionOption extends IOptionOption {
  key: string;
  changeCallback: () => void;
}
export function genOption(object: any, ui: IGenOptionOption) {
  const changeFn = ui.changeCallback || noop;
  ui.value = object[ui.key];
  ui.name = ui.name || ui.key;
  ui.change = function (event, uiInfo) {
    object[ui.key] = uiInfo.value;
    changeFn();
  };
  return makeOption(ui);
}

export interface IGenUIResult {
  elem: Element;
  updateValue: (v: number) => void;
}
export interface IGenUIFunc {
  (object: any, ui: any): IGenUIResult;
}

const uiFuncs: {[key: string]: IGenUIFunc} = {
  slider: genSlider,
  checkbox: genCheckbox,
  option: genOption,
};

export interface IUIInfo {
  type: string;
  key: string;
  changeCallback: () => void;
}

export function setupUI(parent: Element, object: any, uiInfos: IUIInfo[]) {
  const widgets: {[key: string]: IGenUIResult} = {};
  uiInfos.forEach(function (ui) {
    const widget = uiFuncs[ui.type](object, ui);
    parent.appendChild(widget.elem);    
    widgets[ui.key] = widget;
  });
  return widgets;
}

export function updateUI(widgets: {[key: string]: IGenUIResult}, data: {[key: string]: number}) {
  Object.keys(widgets).forEach(key => {
    const widget = widgets[key];
    widget.updateValue(data[key]);
  });
}

export function getQueryParams(): any {
  var params: any = {};
  // @ts-ignore
  if (window.hackedParams) {
    // @ts-ignore
    Object.keys(window.hackedParams).forEach(function (key) {
      // @ts-ignore
      params[key] = window.hackedParams[key];
    });
  }
  if (window.location.search) {
    window.location.search.substring(1).split("&").forEach(function (pair) {
      var keyValue = pair.split("=").map(function (kv) {
        return decodeURIComponent(kv);
      });
      params[keyValue[0]] = keyValue[1];
    });
  }
  return params;
}

export default {
  setupSlider,
  makeSlider,
  makeCheckbox,
  makeOption,
  setupUI,
  updateUI,
  getQueryParams,
}