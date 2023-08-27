import socket
import mysql.connector

# Configuración del socket
IP = "0.0.0.0"
PUERTO = 25565

# Configuración de la base de datos MySQL
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "123456"
DB_NAME = "ubicaciones"

# Crear la tabla si no existe
def crear_tabla():
    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mensajes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            remitente VARCHAR(255),
            mensaje TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Insertar un mensaje en la base de datos
def insertar_mensaje(remitente, mensaje):
    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO mensajes (remitente, mensaje) VALUES (%s, %s)", (remitente, mensaje))
    conn.commit()
    conn.close()

# Crear el socket UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((IP, PUERTO))

crear_tabla()  # Asegurarse de que la tabla exista

print(f"Escuchando en {IP}:{PUERTO}...")

try:
    while True:
        data, addr = sock.recvfrom(1024)
        remitente = addr[0]
        mensaje = data.decode('utf-8')
        print(f"Recibido desde {remitente}: {mensaje}")
        
        # Almacenar el mensaje en la base de datos MySQL
        insertar_mensaje(remitente, mensaje)
except KeyboardInterrupt:
    print("Deteniendo el socket...")
finally:
    sock.close()