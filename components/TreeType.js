// TreeType.js
export default {
    name: 'TreeType',
    template: `
        <div class="panel">
            <p class="panel-heading" @click="select">
                {{ name }}
            </p>
            <transition name="fade">
                <div class="content">
                    <slot></slot>
                </div>
            </transition>
        </div>
    `,
    props: {
        name: String
    },
    data() {
        return {
            
        };
    },
    methods: {
        select() {
            
        }
    }
};
