import { useState, useEffect } from "react";
import avi from '../assets/image.png';
import Button from "../components/button.component";
import { useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase/firebase.utils";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";


const SignUp = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [err1, setErr1] = useState(false);
    const [err, setErr] = useState(false);
    const [err2, setErr2] = useState(null);
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let timerId = setInterval(() => {
            setErr1(false);
        }, 4000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        let timerId = setInterval(() => {
            setErr(false);
        }, 4000);
        return () => clearInterval(timerId);
    }, []);


    const style = {
        formWrapper: `h-[100vh] flex items-center justify-center bg-sky-200`,
        formContainer: `flex sm:min-h-[20em] h-[100%] py-[5rem] w-[25em] bg-white sm:rounded-[0.5em] flex flex-col py-[1em] px-[2em]`,
        form: ` flex flex-col  min-h-[20em] overflow-hidden `,
        input: `border-b border-sky-300 mb-[0.5em] py-[0.5em] outline-none`,
        title: `text-[1.5em] text-center text-sky-900 mb-[1em] font-mono font-bold`,
        desc: ` text-center text-sky-900 text-[1.2em] font-medium`,
        avatar: `h-[2em] w-[2em]`,
        label: `flex flex-row space-x-[1em] items-center`,
        avatardesc: `text-sky-900`,
        spansignin: `text-sky-500 cursor-pointer`
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length <= 4) {
            setErr(true);
            return;
        }
        else if (password !== confirmPassword) {
            setErr1(true)
            return;
        }

        try {
            setSubmitting(true)
            const { user } = await createUserWithEmailAndPassword(auth, email, password)
            const storageRef = ref(storage, displayName);

            uploadBytesResumable(storageRef, avatar).then(
                () => {

                    getDownloadURL(storageRef).then(async (URL) => {
                        console.log('File available at', URL);

                        await updateProfile(user, {
                            displayName,
                            photoURL: URL
                        });
                        const createdAt = new Date().toDateString()
                        await setDoc(doc(db, 'chudChatUsers', user.uid), {
                            uid: user.uid,
                            email,
                            chudChatHandle: displayName.toLowerCase(),
                            photoURL: URL,
                            createdAt: createdAt
                        })
                        await setDoc(doc(db, 'userChats', user.uid), {})
                    });
                });
            setEmail('');
            setPassword('');
            setDisplayName('');
            setConfirmPassword('');
            setAvatar(null);

            navigate('/');
        }


        catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;

            setErr2(errorMessage)


        };
    }

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }
    const handleDisplayName = (e) => {
        setDisplayName(e.target.value)
    }
    const handlePassword = (e) => {
        setPassword(e.target.value)
    }
    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value)
    }
    const handleAvatar = (e) => {
        setAvatar(e.target.files[0])
    }


    return (
        <div className={style.formWrapper}>
            <div className={style.formContainer}>
                <div className={style.title}>Chud-Chat</div>
                <div className={style.desc}>Sign up here</div>
                <form className={style.form} onSubmit={handleSubmit}>
                    <input type="text"
                        placeholder="display name"
                        onChange={handleDisplayName}
                        className={style.input}
                        required />

                    <input type='email'
                        placeholder="email"
                        onChange={handleEmail}
                        className={style.input} required />

                    <input type='password'
                        placeholder="choose password"
                        onChange={handlePassword}
                        className={style.input} />
                    {err && <span className="text-[0.8em] text-red-500">Password should be 5 or more characters</span>}

                    <input type='password'
                        placeholder="confirm password"
                        onChange={handleConfirmPassword}
                        className={style.input} />
                    {err1 && <span className="text-[0.8em] text-red-500">Passwords do not match!</span>}

                    <input type="file"
                        className={`${style.input} hidden`}
                        onChange={handleAvatar}
                        id="photo" />
                    <label htmlFor="photo" className={style.label}>
                        <img src={avi} alt='add icon' className={style.avatar} />
                        <span className={style.avatardesc}>choose a profile picture</span>
                    </label>
                    <div className="text-red-500 text-[14px]">{err2}</div>
                    
                    <Button signup>{submitting ? 'please wait...' : 'register'}</Button>
                </form>
                <div>
                    Do you have an account? <span className={style.spansignin} onClick={() => navigate('/signin')}> Sign In </span> here.
                </div>
            </div>
        </div>
    );
}

export default SignUp;