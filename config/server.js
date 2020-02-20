const Server = {
	JWT_ERRORS: ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'],
	FILE_LIMITS: {
		fieldSize: 1000 * 1024 * 1024, // Максимальный размер значения поля
		fieldNameSize: 100, // Максимальный размер имени файла
		fields: 5, // Максимальное количество не-файловых полей
		fileSize: 1000 * 1024 * 1024, // Максимальный размер файла в байтах для multipart-форм
		files: 5, // Максимальное количество полей с файлами для multipart-форм
		parts: 10, // Максимальное количество полей с файлами для multipart-форм (поля плюс файлы)
		headerPairs: 2000 // Максимальное количество пар ключ-значение key=>value для multipart-форм, которое обрабатывается
	},
	INVALID_EXTENSIONS: ['.exe', '.dmg', '.bat', '.js', '.sh'],
	IMAGES_PER_PAGE: 8
}

module.exports = Server
