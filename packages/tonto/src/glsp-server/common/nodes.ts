import { GCompartment, GLabel } from "@eclipse-glsp/server";

export function createHeader(text: string, containerId: string): GCompartment {
    return GCompartment.builder()
        .id(`${containerId}_header`)
        .layout("hbox")
        .addLayoutOption("hAlign", "center")
        .addLayoutOption("vAlign", "center")
        .addLayoutOption("paddingTop", 3)
        .addCssClass("header-compartment")
        .add(GLabel.builder().text(text).id(`${containerId}_label`).addCssClass("header-label").build())
        .build();
}