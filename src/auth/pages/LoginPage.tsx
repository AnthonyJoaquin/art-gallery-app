import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';

import type { LoginFormInputs } from '../types';
import { authErrors } from '../errors/auth-errors';

import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';
import { startLoginWithEmailAndPassword } from '../../store/auth';

import { AuthLayout } from '../layout';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { status, errorMessage } = useAppSelector((state) => state.auth);
  const isAuthenticating = useMemo(() => status === 'checking', [status]);

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    watch,
  } = useForm<LoginFormInputs>();

  const onSubmit = () => {
    console.log(errors);

    if (!isValid) return;

    const formValues = watch();

    dispatch(startLoginWithEmailAndPassword(formValues));
  };

  return (
    <AuthLayout title="Iniciar sesión">
      <form
        aria-label="submit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="animate__animated animate__fadeIn animate__faster"
      >
        <Grid container direction="column">
          <Grid sx={{ mt: 2 }}>
            <TextField
              label="Correo"
              type="email"
              placeholder="correo@mail.com"
              fullWidth
              error={errors.email !== undefined}
              helperText={errors.email?.message}
              {...register('email', { required: authErrors.email.required })}
            />
          </Grid>

          <Grid sx={{ mt: 2 }}>
            <TextField
              label="Contraseña"
              type="password"
              placeholder="Contraseña"
              fullWidth
              inputProps={{ 'data-testid': 'password' }}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: authErrors.password.required,
              })}
            />
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, mt: 2 }}>
            <Grid xs={12} sx={{ display: !errorMessage === false ? '' : 'none' }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Grid>

            <Grid xs={12}>
              <Button
                disabled={isAuthenticating}
                type="submit"
                variant="contained"
                fullWidth
              >
                <Typography>Login</Typography>
              </Button>
            </Grid>
          </Grid>

          <Grid container justifyContent="end">
            <Link component={RouterLink} color="inherit" to="/auth/register">
              Crear una cuenta
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};
