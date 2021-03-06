import React from 'react';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';

function RegistarationForm () {
    const [User, setUser] = React.useState([]);
    const [Error,setError] = React.useState("");
    const [authError,setAuthError] = React.useState("");
    const navigate = useNavigate();
    React.useEffect(() => {
        axios('http://127.0.0.1:3030/api/auth',{method: 'post',mode:'no-cors',withCredentials: true})
        .then(res => {setUser(res.data)})
        .catch(err => {setAuthError(err)})
    }, [])
    const resetErrorAlert = () => setError(false);
    const msgError = () => {
        if (Error === "Request failed with status code 422") {
            return "Почта или никнейм не уникальны!"
        }
        if (Error === "Request failed with status code 400") {
            return "Ваша почта не входит в список разрешенных!"
        }
    }
    const errorAlert = () => {
        if (Boolean(Error)) {
            return <Alert variant="filled" severity="error">{msgError(Error)}</Alert>
        }
    }
    const registrationFormComponent = () => {
        if (User.auth_data) {
            return navigate(`/user/${User.auth_data.username}`)
        } else {
            return <div>
                <div className="form_wrapper">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {errors.login && <p>{errors.login.message}</p>}
                        <input className="login"
                        placeholder="Никнейм"
                        onChange={(e) => {resetErrorAlert()}}
                        {...register("login", {required: "Это обязательное поле",
                        minLength: {value: 2,message: "Нужен более длинный никнейм"},
                        maxLength: {value: 15,message: "Нужен более короткий никнейм"}
                        })}
                        />
                        {errors.password && <p>{errors.password.message}</p>}
                        <input className="password"
                        placeholder="Пароль"
                        {...register("password", {required: "Это обязательное поле"})}
                        onChange={(e) => {console.log(Error)}}
                        type="password"/>
                        {errors.email && <p>{errors.email.message}</p>}
                        <input className="email"
                        placeholder="Почта"
                        onChange={(e) => {resetErrorAlert()}}
                        {...register("email", {required: "Это обязательное поле",min:3,max:15})}
                        type="email"/>
                        <input type="submit" value="Регистрация" />
                    </form>
                </div>
            </div>
        }

    }
    const {register, formState: { errors }, handleSubmit } = useForm({
        mode: "onChange"
    });
    const onSubmit = (data) => {
        axios({method: 'post',url:'http://127.0.0.1:3030/api/register',withCredentials: true, headers: {}, data: {username: data.login, password: data.password, email:data.email}})
        .then(response => {navigate('/check_email')})
        .catch(error => {setError(error.message)})
    }
    return (
        <div>
            {registrationFormComponent()}
            {errorAlert()}
        </div>
)}

export default RegistarationForm;
