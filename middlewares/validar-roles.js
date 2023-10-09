const { response, request } = require('express');

const isAdminRole = (req = request, res = response, next) => {

    if ( !req.usuario ) {
        return res.status(500).json({
            msg: 'Se quiere verificar el rol sin validar primero'
        });
    }

    const { rol, nombre } = req.usuario;
    if (rol !== 'ADMIN_ROLE') {
        return res.status(401).json({
            msg: `${ nombre } no eres administrador - No estas autorizado para realizar esta acción`
        });
    }

    next();
}

const tieneRole = ( ...roles ) => {
    return (req = request, res = response, next) => {

        if ( !req.usuario ) {
            return res.status(500).json({
                msg: 'Se quiere verificar el rol sin validar primero'
            });
        }

        if ( !roles.includes(req.usuario.rol)) {
            return res.status(401).json({
                msg: 'No estás autorizado para realizar esta acción.'
            });
        }

        next();
    }
}

module.exports = {
    isAdminRole,
    tieneRole
}