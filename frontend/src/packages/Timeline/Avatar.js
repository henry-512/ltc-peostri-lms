const styles = {
    avatar: {
        width: 25,
        height: 25,
    },
};

const AvatarView = ({ user, classes }) => (
    <Avatar
        className={classes.avatar}
        src={
            user
                ? `https://www.gravatar.com/avatar/${user}?d=retro`
                : `https://www.gravatar.com/avatar/?d=mp`
        }
    />
);

const Avatar = withStyles(styles)(AvatarView);

export default Avatar;
