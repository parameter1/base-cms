const OmedaWufooForm = () => import(/* webpackChunkName: "p1-fii-omeda-wufoo-form" */ './omeda-wufoo-form.vue');
const OmedaAlchemerForm = () => import(/* webpackChunkName: "p1-fii-omeda-alchemer-form" */ './omeda-alchemer-form.vue');

export default (Browser) => {
  Browser.register('P1FIIOmedaAlchemerForm', OmedaAlchemerForm);
  Browser.register('P1FIIOmedaWufooForm', OmedaWufooForm);
};
