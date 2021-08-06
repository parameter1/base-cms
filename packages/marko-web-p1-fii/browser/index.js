const OmedaWufooForm = () => import(/* webpackChunkName: "p1-fii-omeda-wufoo-form" */ './omeda-wufoo-form.vue');

export default (Browser) => {
  Browser.register('P1FIIOmedaWufooForm', OmedaWufooForm);
};
