import styles from './Message.module.css';

import { createSignal, Show, createResource, For, createEffect } from "solid-js";

async function fetchApi(obj) {
    let response = await fetch(`/api/luggage/${obj.id}`);
    return response.json();
}

async function fetchFeatures(obj) {
    let response = await fetch(`/api/features${obj.hash}`);
    return response.json();
}

const catColors = [
    "rosewater",
    "flamingo",
    "pink",
    "mauve",
    "red",
    "maroon",
    "peach",
    "yellow",
    "green",
    "teal",
    "sky",
    "sapphire",
    "blue",
    "lavender",
];

function Luggage(props) {
    const [color, setColor] = createSignal("--cat-blue");
    const [hash, setHash] = createSignal("");

    const newRngHash = () => {
        setHash("?hash=" + Math.floor(Math.random() * 65536).toString(16));
    }

    const ui_luggage = () => { return {
        id: props.id,
        hash: hash()
    }}

    const ui_features = () => { return {
        hash: hash()
    }}

    const [uiFeatures] = createResource(ui_features, fetchFeatures);
    const [uiLuggage] = createResource(ui_luggage, fetchApi);

    const matchesFilters = () => {
        if(props.brand && props.brand !== uiLuggage().brand)
            return false;
        if(props.size && props.size !== uiLuggage().size)
            return false;
        if(props.shell && props.shell !== uiLuggage().shell)
            return false;

        let filter_features = props.features;
        let these_features = uiLuggage().features;
        while(filter_features > 0) {
            if((filter_features & 1) && !(these_features & 1))
                return console.log("nope") && false;
            filter_features >>= 1;
            these_features >>= 1;
        }

        return true;
    }

    const featuresArray = () => {
        const features = [];
        for(let i in uiFeatures()) {
            if(uiLuggage().features & i)
                features.push(uiFeatures()[i]);
        }
        return features;
    }

    createEffect(() => {
        setColor(catColors[Math.floor(Math.random() * catColors.length)]);
    });

    const toggleSold = async () => {
        if(uiLuggage().sold)
            await fetch(`/api/luggage/${props.id}/mark/unsold`);
        else
            await fetch(`/api/luggage/${props.id}/mark/sold`);
        newRngHash();
        props.newRngHash();
    }

    const sellClasses = () => { return {
        [styles.btn]: true,
        [styles.btnSold]: uiLuggage().sold,
        [styles.btnSell]: !uiLuggage().sold
    }}

    const cartClasses = () => { return {
        [styles.btn]: true,
        [styles.btnSold]: props.cart.includes(uiLuggage().id),
        [styles.btnCart]: !props.cart.includes(uiLuggage().id)
    }}

    return (
        <Show when={ uiLuggage() && matchesFilters() }>
            <div class={ styles.luggageEmbed } style={{ "--color": "var(--cat-" + color() + ")" }}>
                <div class={ styles.luggageInfo }>
                    <div class={ styles.leftPanel }>
                        <h1>{ uiLuggage().brand }</h1>
                        <h2>{ uiLuggage().size }</h2>
                    </div>
                    <div class={ styles.rightPanel }>
                        <h1 data-id={ uiLuggage().id } data-value={ uiLuggage().price }>${ uiLuggage().price }</h1>
                    </div>
                </div>
                <div class={ styles.luggageDescription }>
                    <ul>
                        <Show when={ uiFeatures() }>
                            <For each={ featuresArray() }>
                            {(feature, index) => (
                                <Show when={ (1 << index()) & props.features } fallback={ <li>{ feature }</li> }>
                                    <li><b><i>{ feature }</i></b></li>
                                </Show>
                            )}
                            </For>
                        </Show>
                    </ul>
                    <Show when={ uiLuggage().sold } fallback={
                        <div class={ styles.btnContainer }>
                            <div classList={ cartClasses() } onclick={ () => props.toggle(uiLuggage().id) }>
                                { props.cart.includes(uiLuggage().id) ? "Return" : "Add" }
                            </div>
                        </div>
                    }>
                        <div class={ styles.btnContainer }>
                            <div classList={ sellClasses() } onclick={ toggleSold }>
                                { uiLuggage().sold ? "Return" : "Resell" }
                            </div>
                        </div>
                    </Show>
                </div>
                <img src={ `/api/luggage/${props.id}/img.webp${hash()}` } onError={ () => setTimeout(newRngHash, 500) }/>
            </div>
        </Show>
    );
}

export default Luggage;
