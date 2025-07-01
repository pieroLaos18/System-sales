<template>
  <div class="inactivity-modal-bg">
    <div class="inactivity-modal">
      <div class="modal-icon">⏳</div>
      <h2>¿Sigues ahí?</h2>
      <p>
        Por seguridad, tu sesión se cerrará pronto por inactividad.<br />
        Haz clic en "Seguir aquí" para continuar.
      </p>
      <button class="btn-primary" @click="$emit('confirm')">Seguir aquí</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InactivityModal'
};
</script>

<style scoped>
.inactivity-modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeInBg 0.3s;
}
@keyframes fadeInBg {
  from { opacity: 0; }
  to { opacity: 1; }
}

.inactivity-modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  padding: 2.5rem 2rem 1.5rem 2rem;
  min-width: 320px;
  max-width: 95vw;
  text-align: center;
  animation: popIn 0.35s cubic-bezier(.68,-0.55,.27,1.55);
  border: 1.5px solid #e0e7ef;
  position: relative;
}
@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: #2563eb;
  filter: drop-shadow(0 2px 6px #38bdf8aa);
  animation: iconPop 0.5s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes iconPop {
  0% { transform: scale(0.7) rotate(-10deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.inactivity-modal h2 {
  margin-bottom: 12px;
  font-size: 1.5rem;
  color: #2563eb;
  font-weight: 700;
}

.inactivity-modal p {
  color: #444;
  font-size: 1.08rem;
  margin-bottom: 28px;
  line-height: 1.5;
}

.btn-primary {
  background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 2.2rem;
  font-size: 1.08rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.10);
  cursor: pointer;
  transition: background 0.2s, transform 0.13s;
}
.btn-primary:hover {
  background: linear-gradient(90deg, #38bdf8 0%, #2563eb 100%);
  transform: scale(1.04);
}
</style>