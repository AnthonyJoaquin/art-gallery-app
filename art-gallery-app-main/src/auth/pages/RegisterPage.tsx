import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';

import type { RegisterFormInputs } from '../types/register-form-inputs';

import { startCreatingUserWithEmailAndPassword } from '../../store/auth';
import { useAppDispatch, useAppSelector } from '../../store/reduxHooks';

import { AuthLayout } from '../layout';
import { authErrors } from '../errors/auth-errors';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const { status, errorMessage } = useAppSelector((state) => state.auth);
  const isChekingAuthentication = useMemo(
    () => status === 'checking',
    [status]
  );

  const {
    formState: { isValid, errors },
    handleSubmit,
    register,
    watch,
  } = useForm<RegisterFormInputs>();

  const onSubmit = () => {
    if (!isValid) return;

    const formValues = watch();
    dispatch(
      startCreatingUserWithEmailAndPassword({
        ...formValues,
        fullName: formValues.fullName,
      })
    );
  };

  return (
    <AuthLayout title="Crear cuenta">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="animate__animated animate__fadeIn animate__faster"
      >
        <Grid container direction="column">
          <Grid sx={{ mt: 2 }}>
            <TextField
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register('fullName', {
                required: authErrors.fullName.required,
              })}
            />
          </Grid>

          <Grid sx={{ mt: 2 }}>
            <TextField
              label="Correo"
              type="email"
              placeholder="correo@google.com"
              fullWidth
              error={!!errors.email}
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
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: authErrors.password.required,
              })}
            />
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, mt: 2 }}>
            <Grid size={12} display={!errorMessage === false ? '' : 'none'}>
              <Alert severity="error">{errorMessage}</Alert>
            </Grid>

            <Grid size={12}>
              <Button
                disabled={isChekingAuthentication}
                variant="contained"
                fullWidth
                type="submit"
              >
                Crear cuenta
              </Button>
            </Grid>
          </Grid>

          <Grid container justifyContent="end">
            <Typography sx={{ mr: 1 }}>¿Ya tienes cuenta?</Typography>
            <Link component={RouterLink} color="inherit" to="/auth/login">
              Ingresar
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};
