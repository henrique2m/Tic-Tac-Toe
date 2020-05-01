import React from 'react';
import { useDispatch } from 'react-redux';
import { GiCaptainHatProfile } from 'react-icons/gi';
import { store } from '../../store';
import { signOut } from '../../store/modules/auth/actions';
import hm from '../../assets/hm.jpg';
import './styles.css';

export default function Profile() {
    const dispatch = useDispatch();
    const { profile } = store.getState().user;

    function handleSignOut() {
        dispatch(signOut(profile._id));
    }

    return (
        <section>
            <div className="avatar">
                <img src={profile.avatar} alt={profile.username} />
            </div>
            <ul>
                <p className="header">
                    <span>
                        <GiCaptainHatProfile size="20" />
                    </span>
                    <strong>Seus dados</strong>
                </p>
                <li>
                    <strong> Nome de usuário: </strong> {profile.username}
                </li>

                <li className="border">
                    <strong> E-mail: </strong> {profile.email}
                </li>
                <li className="border logout">
                    <button type="button" onClick={() => handleSignOut()}>
                        Sair
                    </button>
                </li>
            </ul>
            <div className="footer">
                <a
                    href="https://www.instagram.com/henrique_moreira2"
                    target="self"
                >
                    <img src={hm} alt="henrique_moreira2" />
                </a>

                <strong>Henrique Moreira</strong>
                <small>henrique_moreira2</small>
                <p>Um jovem que gosta criar coisas.</p>
            </div>
        </section>
    );
}
