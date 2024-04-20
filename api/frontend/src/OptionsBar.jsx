import { $, $$ } from "./$";
import { createSignal, createResource, Show, For } from "solid-js";

import styles from "./Message.module.css";

function OptionsBar(props) {
    const sellAll = async () => {
        await Promise.all(props.cart.map((id) => (
            id > 0 ? fetch(`/api/luggage/${id}/mark/sold`) : undefined
        )));
        props.setCart([0]);
        props.newRngHash();
    }


    return (
        <div class={ styles.optionsBar}>
            <div>
                <div
                        class={ styles.btn + " " + styles.btnAction }
                        onclick={ () => $("." + styles.filterContainer).scrollIntoView({ behavior: "smooth" }) }
                >
                    Filter
                </div>
                <div
                        class={ styles.btn + " " + styles.btnUpload }
                        onclick={ () => $("." + styles.uploadContainer).scrollIntoView({ behavior: "smooth" }) }
                >
                    Upload
                </div>
            </div>
            <div>
                <div data-id="0" data-value="0"/>
                <div class={ styles.btn + " " + styles.btnSell } onclick={ sellAll }>
                    { "$" }{ props.cart.reduce((acc, id) => acc + Number($(`[data-id="${id}"]`).dataset.value)) }
                </div>
            </div>
        </div>
    );
}

export default OptionsBar;
