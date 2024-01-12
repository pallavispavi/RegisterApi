const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const app = express();
const port = 3000;

app.use(bodyParser.json());









const users = [];
const passwordResetTokens = {}; 


app.post('/api/register', async (req, res) => {
  
  const { username, email, password } = req.body;

  
  if (users.some(user => user.username === username || user.email === email)) {
    return res.status(400).json({ message: 'Username or email already exists' });
  }

  
  const hashedPassword = await bcrypt.hash(password, 10);

  
  users.push({ username, email, password: hashedPassword });

  res.json({ message: 'Registration successful' });

});


app.post('/api/login', async (req, res) => {
 
  const { username, password } = req.body;

 
  const user = users.find(user => user.username === username);

  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  

  res.json({ message: 'Login successful'  });

});


app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Email not found' });
  }

 
  const resetToken = Math.random().toString(36).substring(7);
  passwordResetTokens[email] = resetToken;
   console.log(passwordResetTokens);
  res.json({ message: 'Password reset token generated', resetToken });
});


app.post('/api/reset-password', (req, res) => {
    const { email, resetToken, newPassword } = req.body;
   console.log(resetToken);
    
    if (passwordResetTokens[email] !== resetToken) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
  
   
    const user = users.find(user => user.email === email);
  
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
  
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
    
    user.password = hashedPassword;
  
    
    delete passwordResetTokens[email];
  
    res.json({ message: 'Password reset successful' });
  });
  

  app.get('/api/user-info',  (req, res) => {
    
  const allUserInfo = users.map(user => ({ username: user.username, email: user.email }));
  res.json(allUserInfo);
  });
  


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
