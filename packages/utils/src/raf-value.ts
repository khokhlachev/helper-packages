import { typedIsFunction } from "./types";

export class RafValue<V> {
  private value!: V;

  constructor(initialValue: V) {
    if (initialValue !== undefined) {
      this.set(initialValue);
    }
  }

  get() {
    return this.value;
  }

  set(action: V | (() => V)) {
    window.requestAnimationFrame(() => {
      this.value = typedIsFunction(action) ? action() : action;
    });
  }
}
