<template>
  <v-footer
    color="#003366"
    class="justify-center flex-wrap"
  >
    <v-btn
      id="footer-home"
      color="white"
      variant="text"
      href="https://www.gov.bc.ca/"
    >
      Home
    </v-btn>
    <v-btn
      id="footer-about"
      color="white"
      variant="text"
      href="https://www2.gov.bc.ca/gov/content/about-gov-bc-ca"
    >
      About gov.bc.ca
    </v-btn>
    <v-btn
      id="footer-disclaimer"
      color="white"
      variant="text"
      href="http://gov.bc.ca/disclaimer"
    >
      Disclaimer
    </v-btn>
    <v-btn
      id="footer-privacy"
      color="white"
      variant="text"
      href="http://gov.bc.ca/privacy"
    >
      Privacy
    </v-btn>
    <v-btn
      id="footer-accessibility"
      color="white"
      variant="text"
      href="http://gov.bc.ca/webaccessibility"
    >
      Accessibility
    </v-btn>
    <v-btn
      id="footer-copyright"
      color="white"
      variant="text"
      href="http://gov.bc.ca/copyright"
    >
      Copyright
    </v-btn>
    <v-btn
      id="footer-contact"
      color="white"
      variant="text"
      href="https://www2.gov.bc.ca/gov/content/home/contact-us"
    >
      Contact Us
    </v-btn>
  </v-footer>
</template>

<script>
export default {};
</script>

<style>
  .v-footer {
    border-top: 2px solid rgb(252, 186, 25) !important;
    min-width: 100%;
  }
</style>
