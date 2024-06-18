import { CrossReferenceContainer, SyntheticElement } from "../../model-server/types.js";

export interface CrossReferenceContext {
    /**
     * The container from which we want to query the reachable elements.
     */
    container: CrossReferenceContainer;
    /**
     * Synthetic elements starting from the container to further narrow down the cross reference.
     * This is useful for elements that are being created or if the element cannot be identified.
     */
    syntheticElements?: SyntheticElement[];
    /**
     * The property of the element referenced through the source container and the optional synthetic
     * elements for which we should retrieve the reachable elements.
     */
    property: string;
}