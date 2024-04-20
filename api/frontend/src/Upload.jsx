import { $, $$ } from "./$";
import { createSignal, createResource, Show, For } from "solid-js";

import styles from "./Message.module.css";

async function fetchBrands(obj) {
    let response = await fetch(`/api/brands${obj.hash}`);
    return response.json();
}

async function fetchApi(obj) {
    let params = new URLSearchParams({
        brand: obj.brand,
        size: obj.size,
        shell: obj.shell,
        features: obj.features
    });
    let response = await fetch(`/api/price/get?` + params.toString());
    return response.json();
}

async function fetchFeatures(obj) {
    let response = await fetch(`/api/features${obj.hash}`);
    return response.json();
}


function Upload(props) {
    const [brandFilter, setBrandFilter] = createSignal("");
    const [sizeFilter, setSizeFilter] = createSignal("CarryOn");
    const [shellFilter, setShellFilter] = createSignal("Soft");
    const [featuresFilter, setFeaturesFilter] = createSignal(0);
    const [price, setPrice] = createSignal("");
    const [imgPath, setImgPath] = createSignal("");

    const ui_brands = () => { return {
        hash: props.hash
    }}

    const ui_features = () => { return {
        hash: props.hash
    }}

    const ui_hash = () => { return {
        brand: brandFilter(),
        size: sizeFilter(),
        shell: shellFilter(),
        features: featuresFilter()
    }}

    const [uiBrands] = createResource(ui_brands, fetchBrands);
    const [uiFeatures] = createResource(ui_features, fetchFeatures);
    const [uiApi] = createResource(ui_hash, fetchApi);

    const updateFeaturesFilter = () => {
        let features = 0;
        for(var checkbox of $$("input[type=checkbox]")) {
            if(checkbox.checked)
                features |= Number(checkbox.id.split("-")[1]);
        }
        setFeaturesFilter(features);
    }

    const detailsCompleted = () => {
        if(brandFilter() === "" || sizeFilter() === "" || shellFilter() === "")
            return false;
        if(imgPath() === "")
            return console.log("no image") && false;
        if(uiApi().price !== null)
            setPrice(uiApi().price);
        if(price() === "")
            return console.log("empty price") && false;
        return true;
    }

    const dataURItoBlob = (dataUri) => {
        const bytes = dataUri.split(',')[0].indexOf('base64')
                    ? atob(dataUri.split(',')[1])
                    : decodeURI(dataUri.split(',')[1]);

        const mime = dataUri.split(',')[0].split(':')[1].split(';')[0];

        const ints = new Uint8Array(bytes.length);
        for(var i = 0; i < bytes.length; i++)
            ints[i] = bytes.charCodeAt(i);

        return new Blob([ints], { type: mime });
    };


    const uploadLuggage = async () => {
        let luggage_hash = uiApi().hash;
        if(uiApi().price === null) {
            let params = new URLSearchParams({
                brand: brandFilter(),
                size: sizeFilter(),
                shell: shellFilter(),
                features: featuresFilter(),
                price: price()
            });
            await fetch(`/api/price/new?` + params.toString());
        }

        const reader = new FileReader();
        reader.onload = () => {
            var image = new Image();
            image.onload = async () => {
                var canvas = document.createElement("canvas");
                var max_size = 1368;
                var width = image.width;
                var height = image.height;

                if(width > height) {
                    if(width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if(height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, width, height);

                var dataUrl = canvas.toDataURL("image/webp", 0.6);
                var blob = dataURItoBlob(dataUrl);

                const formData = new FormData();
                formData.append("image", blob);

                await fetch(`/api/luggage/new/${luggage_hash}`, {
                    method: "POST",
                    body: formData
                });

                props.newRngHash();
                $("." + styles.listingContainer).scrollIntoView({ behavior: "smooth" })
                setImgPath("");
                $("#upload-img").value = "";
            }
            image.src = reader.result;
        }
        reader.readAsDataURL($("#upload-img").files[0]);
    }

    return (
        <div class={ styles.uploadContainer }>
            <div class={ styles.filterEntry }>
                <h1>Brand:</h1>
                <input type="text" list="brandList" onInput={ e => setBrandFilter(e.target.value.trim()) }/>
                <datalist id="brandList">
                    <Show when={ uiBrands() }>
                        <For each={ uiBrands() }>
                            {brand => (
                                <option value={ brand }>{ brand }</option>
                            )}
                        </For>
                    </Show>
                </datalist>
            </div>
            <div class={ styles.filterEntry }>
                <h1>Size:</h1>
                <select onInput={ e => setSizeFilter(e.target.value) }>
                    <optgroup label="Single unit">
                        <option value="UnderSeater">Under-Seater</option>
                        <option value="CarryOn" selected="selected">Carry-On</option>
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
                <select onInput={ e => setShellFilter(e.target.value) }>
                    <option value="Soft">Soft</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
            <hr/>
            <div data-name="upload">
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
            <hr/>
            <div class={ styles.filterEntry }>
                <h1>Price:</h1>
                <Show when={ uiApi() && uiApi().price !== null } fallback={
                    <input
                        type="number"
                        id="upload-price"
                        min="15"
                        max="215"
                        value={ setPrice("") }
                        style={{ width: "96px" }}
                        onInput={ (e) => setPrice(e.target.value) }
                    />
                }>
                    <h2>${ uiApi().price }</h2>
                </Show>
            </div>
            <hr/>
            <div class={ styles.filterEntry } style={{ "padding-bottom": "24px" }}>
                <h1>Image:</h1>
                <input
                    type="file"
                    id="upload-img"
                    accept="image/*"
                    style={{ "align-self": "center" }}
                    onInput={ (e) => setImgPath(URL.createObjectURL(e.target.files[0])) }
                />
            </div>
            <Show when={ detailsCompleted() } fallback={
                <div
                    class={ styles.btn + " " + styles.btnSold }
                    onclick={ () => $("." + styles.listingContainer).scrollIntoView({ behavior: "smooth" }) }
                >
                    Cancel
                </div>
            }>
                <div
                    class={ styles.btn + " " + styles.btnUpload }
                    onclick={ () => uploadLuggage() }
                >
                    Upload
                </div>
            </Show>
        </div>
    );
}

export default Upload;

