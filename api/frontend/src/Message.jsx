import { $ } from "./$";
import { createSignal, createResource, Show, For, createEffect } from "solid-js";

import styles from "./Message.module.css";
import Luggage from "./Luggage";
import Filters from "./Filters";
import OptionsBar from "./OptionsBar";
import Upload from "./Upload"

async function fetchApi(obj) {
    let response = await fetch(`/api/inventory${obj.sold}${obj.hash}`);
    return response.json();
}

function Message() {
    const [hash, setHash] = createSignal("");
    const [soldStatus, setSoldStatus] = createSignal("");
    const [brandFilter, setBrandFilter] = createSignal("");
    const [sizeFilter, setSizeFilter] = createSignal("");
    const [shellFilter, setShellFilter] = createSignal("");
    const [featuresFilter, setFeaturesFilter] = createSignal("");
    const [idFilter, setIdFilter] = createSignal("");

    const [cart, setCart] = createSignal([0]);

    const newRngHash = () => {
        setHash("?hash=" + Math.floor(Math.random() * 65536).toString(16));
    }

    const ui_inventory = () => { return {
        sold: soldStatus(),
        hash: hash()
    }}

    const [uiInventory] = createResource(ui_inventory, fetchApi);

    createEffect(() => {
        $("." + styles.listingContainer).scrollIntoView({ behavior: "smooth" });
    });

    const toggleCart = (id) => {
        if(cart().includes(id))
            setCart(cart().filter(item => item != id));
        else
            setCart([...cart(), id]);
    }

    return (
        <div class={ styles.messageContainer }>
            <Filters
                    setSoldStatus={ setSoldStatus }
                    setBrandFilter={ setBrandFilter }
                    setSizeFilter={ setSizeFilter }
                    setShellFilter={ setShellFilter }
                    setFeaturesFilter={ setFeaturesFilter }
                    setIdFilter={ setIdFilter }
                    hash={ hash() }
            />
            <div class={ styles.listingPage }>
                <div class={ styles.listingContainer }>
                    <Show when={ uiInventory() }>
                        <For each={ uiInventory() }>
                        {item => (
                            <Show when={ idFilter() ? item == idFilter() : true }>
                                <Luggage
                                        id={ item }
                                        brand={ brandFilter() }
                                        size={ sizeFilter() }
                                        features={ featuresFilter() }
                                        shell={ shellFilter() }
                                        toggle={ toggleCart }
                                        cart={ cart() }
                                        newRngHash={ newRngHash }
                                />
                            </Show>
                        )}
                        </For>
                    </Show>
                </div>
                <OptionsBar
                        cart={ cart() }
                        setCart={ setCart }
                        newRngHash={ newRngHash }
                />
            </div>
            <Upload hash={ hash() } newRngHash={ newRngHash }/>
        </div>
    );
}

export default Message;
