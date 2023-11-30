const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
    registerUser: async (req, res) =>{
        try {
            const {username, email, password} = req.body;
            const user = await Users.findOne({email: email})
            if(user) return res.status(400).json({msg: "The email already exists."})

            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                username: username,
                email: email,
                password: passwordHash
            })
            await newUser.save()
            res.json({msg: "Sign up Success"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    loginUser: async (req, res) =>{
        try {
            const {email, password} = req.body;
            const user = await Users.findOne({email: email})
            if(!user) return res.status(400).json({msg: "User does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Incorrect password."})

            // if login success create token
            const payload = {id: user._id, name: user.username}
            const token = jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: "1d"})

            res.json({token})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    verifiedToken: (req, res) =>{
        try {
            const token = req.header("Authorization")
            if(!token) return res.send(false)

            jwt.verify(token, process.env.TOKEN_SECRET, async (err, verified) =>{
                if(err) return res.send(false)

                const user = await Users.findById(verified.id)
                if(!user) return res.send(false)

                return res.send(true)
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    } ,
    updateBio : async (req, res) => {
        try {
          const { bio } = req.body;
          // Actualizar la biografía del usuario autenticado
          const updatedUser = await User.findByIdAndUpdate(req.user._id, { bio }, { new: true });
          res.json({ message: "Biografía actualizada", updatedUser });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },
      updateProfilePicture : async (req, res) => {
        try {
          // El proceso para la foto de perfil dependerá de si estás recibiendo un archivo o una URL
          // Si estás subiendo un archivo de imagen, necesitarás una librería como multer para manejar la subida
          const { imageUrl } = req.body; // Asumiendo que estás enviando una URL
          const updatedUser = await User.findByIdAndUpdate(req.user._id, { profilePicture: imageUrl }, { new: true });
          res.json({ message: "Foto de perfil actualizada", updatedUser });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },
      getUserByUsername : async (req, res) => {
        try {
            // Encuentra el usuario por username. Asegúrate de que el modelo de usuario tiene un campo 'username'.
            const user = await Users.findOne({ username: req.params.username }).select('-password');
            if (!user) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error en el servidor');
        }
    }
}


module.exports = userCtrl