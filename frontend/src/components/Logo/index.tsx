export type LogoProps = {
    sx?: object
}

const Logo = (props: LogoProps) => {
    return (
        <img src="/logo.png" alt="PEO STRI LOGO" height="32px" style={props.sx} />
    );
};

export default Logo;
