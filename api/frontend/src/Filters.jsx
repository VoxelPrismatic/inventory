import { $, $$ } from "./$";
import { createSignal, createResource, Show, For } from "solid-js";

import styles from "./Message.module.css";

async function fetchBrands(obj) {
    let response = await fetch(`/api/brands${obj.hash}`);
    return response.json();
}

async function fetchFeatures(obj) {
    let response = await fetch(`/api/features${obj.hash}`);
    return response.json();
}

function Filters(props) {
    const ui_brands = () => { return {
        hash: props.hash
    }}

    const ui_features = () => { return {
        hash: props.hash
    }}

    const [uiBrands] = createResource(ui_brands, fetchBrands);
    const [uiFeatures] = createResource(ui_features, fetchFeatures);

    const updateFeaturesFilter = () => {
        let features = 0;
        for(var checkbox of $$("[data-name=filter] input[type=checkbox]")) {
            if(checkbox.checked)
                features |= Number(checkbox.id.split("-")[1]);
        }
        console.log(features);
        props.setFeaturesFilter(features);
    }

    return (
        <div class={ styles.filterContainer }>
            <div class={ styles.filterEntry }>
                <h1>Sold status:</h1>
                <select onInput={ e => props.setSoldStatus(e.target.value) }>
                    <option value="/all">All</option>
                    <option value="/sold">Sold</option>
                    <option value="" selected="selected">Available</option>
                </select>
            </div>
            <div class={ styles.filterEntry }>
                <h1>Brand:</h1>
                <select onInput={ e => props.setBrandFilter(e.target.value) }>
                    <option value="">All brands</option>
                    <Show when={ uiBrands() }>
                        <For each={ uiBrands() }>
                            {brand => (
                                <option value={ brand }>{ brand }</option>
                            )}
                        </For>
                    </Show>
                </select>
            </div>
            <div class={ styles.filterEntry }>
                <h1>Size:</h1>
                <select onInput={ e => props.setSizeFilter(e.target.value) }>
                    <option value="">All sizes</option>
                    <optgroup label="Single unit">
                        <option value="UnderSeater">Under-Seater</option>
                        <option value="CarryOn">Carry-On</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </optgroup>
                    <optgroup label="Double Set">
                        <option value="CarryOn+Medium">Carry-On + Medium</option>
                        <option value="CarryOn+Large">Carry-On + Large</option>
                        <option value="Medium+Large">Medium + Large</option>
                    </optgroup>
                    <optgroup label="Triple Set">
                        <option value="Triple">Triple</option>
                    </optgroup>
                    <optgroup label="Other Luggages">
                        <option value="SkiBag">Ski Bag</option>
                        <option value="Duffle">Duffle</option>
                        <option value="Backpack">Backpack</option>
                    </optgroup>
                </select>
            </div>
            <div class={ styles.filterEntry }>
                <h1>Shell:</h1>
                <select onInput={ e => props.setShellFilter(e.target.value) }>
                    <option value="">All shells</option>
                    <option value="Soft">Soft</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
            <hr/>
            <div style={{ "padding-bottom": "24px" }} data-name="filter">
                <h1>Features:</h1>
                <Show when={ uiFeatures() }>
                    <For each={ Object.keys(uiFeatures()) }>
                    {bit => (
                        <div>
                            <input type="checkbox" id={ `feature-${bit}` } onInput={ (e) => updateFeaturesFilter() }/>
                            { uiFeatures()[bit] }
                            <br/>
                        </div>
                    )}
                    </For>
                </Show>
            </div>
            <div
                    class={ styles.btn + " " + styles.btnSell }
                    onclick={ () => $("." + styles.listingContainer).scrollIntoView({ behavior: "smooth" }) }
            >
                Apply
            </div>
        </div>
    );
}

export default Filters;
