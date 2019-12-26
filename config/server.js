const Server = {
	JWT_ERRORS: ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'],
	FILE_LIMITS: {
		fieldSize: 1000 * 1024 * 1024, // Максимальный размер значения поля
		fieldNameSize: 100, // Максимальный размер имени файла
		fields: 2, // Максимальное количество не-файловых полей
		fileSize: 1000 * 1024 * 1024, // Максимальный размер файла в байтах для multipart-форм
		files: 1, // Максимальное количество полей с файлами для multipart-форм
		parts: 3, // Максимальное количество полей с файлами для multipart-форм (поля плюс файлы)
		headerPairs: 2000 // Максимальное количество пар ключ-значение key=>value для multipart-форм, которое обрабатывается
	}
}

module.exports = Server
