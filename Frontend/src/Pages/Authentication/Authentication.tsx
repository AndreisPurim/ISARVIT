import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

import LoginCard from "./LoginCard.tsx";
import SignupCard from "./SignupCard.tsx";

type MockUser = {
    id: number;
    username: string;
    password: string;
    email?: string;
    admin: boolean;
    description: string;
    joined: string;
    last_seen: string;
    avatar: string;
    chips: {type: string; label: string}[];
    favorites: number[];
    recents: {[key: string]: string};
    created: number[];
};

export default function Authentication(
    props: JSX.IntrinsicAttributes & {
        auth: "login" | "signup";
        example: {users: {[x: string]: any}};
        setExample: (arg0: any) => void;
        setControl: (arg0: any) => void;
        setView: (arg0: string) => void;
        control: any;
        setAlert: (arg0: {open: boolean; text: string; severity: string}) => void;
    }
) {
    const [card, setCard] = React.useState(props.auth === "login" ? 0 : 1);
    const change = (event: any, newValue: React.SetStateAction<number>) => {
        setCard(newValue);
    };

    const usernameFromEmail = (email = "") => email.trim().toLowerCase().split("@")[0];

    const findMockUser = (user: {email?: string; username?: string}) => {
        const email = user.email?.trim().toLowerCase();
        const username = (user.username || usernameFromEmail(email)).trim().toLowerCase();

        return Object.values(props.example.users).find((mockUser: any) => {
            return mockUser.username?.toLowerCase() === username || mockUser.email?.toLowerCase() === email;
        }) as MockUser | undefined;
    };

    const authenticate = (user: any, auth: "login" | "signup") => {
        switch (auth) {
            case "login":
                handleLogin(user);
                break;
            case "signup":
                handleSignup(user);
                break;
        }
    };

    const handleLogin = (user: any) => {
        const mockUser = findMockUser(user);
        if (mockUser && mockUser.password === user.password) {
            props.setControl({...props.control, user: mockUser, view: "profile"});
            props.setAlert({open: true, text: "Connected", severity: "success"});
            return;
        }

        props.setAlert({
            open: true,
            text: mockUser ? "Wrong Password" : "User not found",
            severity: "error",
        });
    };

    const handleSignup = (user: any) => {
        const username = user.username.trim().toLowerCase();
        const email = user.email.trim().toLowerCase();
        const users = props.example.users;
        const userExists = Boolean(users[username]) || Boolean(findMockUser({email, username}));

        if (userExists) {
            props.setAlert({open: true, text: "Username or email already in use", severity: "error"});
            return;
        }

        const maxID = Math.max(...Object.values(users).map((mockUser: any) => mockUser.id || 0), 0);
        const newUser: MockUser = {
            id: maxID + 1,
            username,
            email,
            password: user.password,
            admin: false,
            description: "Demo user",
            joined: new Date().toISOString().slice(0, 10),
            last_seen: new Date().toISOString().slice(0, 10),
            avatar: "",
            chips: [
                {type: "favorites", label: "0 Favorites"},
                {type: "created", label: "0 Created"},
            ],
            favorites: [],
            recents: {},
            created: [],
        };

        props.setExample({...props.example, users: {...users, [username]: newUser}});
        props.setControl({...props.control, user: newUser, view: "profile"});
        props.setAlert({open: true, text: "Created!", severity: "success"});
    };

    return (
        <Container maxWidth="sm">
            <Grid container direction="column" justifyContent="center" alignItems="center">
                <Grid item>
                    <Tabs value={card} onChange={change} indicatorColor="primary" textColor="primary">
                        <Tab label="Login" />
                        <Tab label="Signup" />
                    </Tabs>
                </Grid>
                <Grid item xs={3} style={{width: "100%"}}>
                    {!card ? <LoginCard {...props} onLogin={authenticate} /> : <SignupCard {...props} onSignup={authenticate} />}
                </Grid>
            </Grid>
        </Container>
    );
}
