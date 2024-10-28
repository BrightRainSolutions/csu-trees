// CollapsiblePanel.js
export default {
    name: 'CollapsiblePanel',
    template: `
        <div class="panel">
            <p class="panel-heading" @click="toggle">
                {{ title }}
                <span class="icon is-pulled-right">
                    <i :class="{'fas': true, 'fa-chevron-up': isOpen, 'fa-chevron-down': !isOpen}"></i>
                </span>
            </p>
            <transition name="fade">
                <div class="content" v-if="isOpen">
                    <slot></slot>
                </div>
            </transition>
        </div>
    `,
    props: {
        title: String
    },
    data() {
        return {
            isOpen: true
        };
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        }
    }
};
