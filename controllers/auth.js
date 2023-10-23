const { response, json } = require("express");
const bcryptjs = require("bcryptjs");

const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");

const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo })
        if(!usuario) {
            return res.status(400).json({
                msg: 'Usuario / Contraseña no son correctos'
            })
        }

        // Si el usuario está activo
        if(!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario / Contraseña no son correctos'
            })
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password );
        if(!validPassword) {
            return res.status(400).json({
                msg: 'Usuario / Contraseña no son correctos'
            })
        }

        // Generar el JWT
        const token = await generarJWT(usuario.id);
        
        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
    
}

const googleSignIn = async(req, res = response) => {
    const { id_token } = req.body;

    try {

        const { nombre, img, correo } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ correo });

        if (!usuario || usuario === null) {
            const data = {
                nombre,
                correo,
                password: ':)',
                img,
                rol: "USER_ROLE",
                google: true
            }

            usuario = new Usuario(data);
            // Guardar en DB
            await usuario.save();
        }


        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador - usuario bloqueado'
            });
        }


        // Generar el JWT
        const token = await generarJWT(usuario.id);
        
        res.json({
            usuario,
            token
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'El token no se pudo verificar'
        })
    }

}

module.exports = {
    login,
    googleSignIn
}