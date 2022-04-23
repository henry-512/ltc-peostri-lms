/**
* @file Logo is a function that takes a LogoProps object and returns an image element with a source, alt text, height, and style.
* @module Logo
* @category Logo
* @author Braden Cariaga
*/

export type LogoProps = {
    sx?: object
}

/**
 * "Logo is a function that takes a LogoProps object and returns an image element with a source, alt
 * text, height, and style."
 * 
 * @param {LogoProps} props
 * @returns An image with the source of /logo.png, the alt text of PEO STRI LOGO, a height of 32px, and
 * the style of props.sx.
 */
const Logo = (props: LogoProps) => {
    return (
        <img src="/logo.png" alt="PEO STRI LOGO" height="32px" style={props.sx} />
    );
};

export default Logo;
