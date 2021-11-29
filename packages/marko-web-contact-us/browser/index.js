const ContactUsForm = () => import(/* webpackChunkName: "contact-us-form" */ './form.vue');

export default (Browser) => {
  Browser.register('ContactUsForm', ContactUsForm);
};
