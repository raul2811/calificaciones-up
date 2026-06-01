import tailwindcss from "@tailwindcss/postcss";

const removeFirefoxNoisyDeclarations = () => ({
  postcssPlugin: "remove-firefox-noisy-declarations",
  Declaration(decl) {
    if (decl.prop === "-webkit-text-size-adjust") {
      decl.remove();
    }
  },
});

removeFirefoxNoisyDeclarations.postcss = true;

const config = {
  plugins: [tailwindcss(), removeFirefoxNoisyDeclarations()],
};

export default config;
