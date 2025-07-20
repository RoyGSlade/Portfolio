# Fonts used in the Character Creator Project

This directory contains the font files utilized in the Character Creator application. 

## Font Licensing

Please ensure that you have the appropriate licenses for any fonts included in this directory. Refer to the individual font files for specific licensing information.

## Usage Instructions

To use the fonts in your project, you can include them in your CSS files as follows:

```css
@font-face {
    font-family: 'YourFontName';
    src: url('path/to/font.woff2') format('woff2'),
         url('path/to/font.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
```

Replace `'YourFontName'` with the actual name of the font and update the `src` paths accordingly. 

## Additional Notes

- Ensure that the font files are correctly referenced in your CSS to achieve the desired typography in your application.
- Consider using web-safe fonts as fallbacks in your CSS for better compatibility across different browsers and devices.