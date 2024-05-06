class DeviceNotFound(Exception):
    # def __init__(self, salary=12, message="Salary is not in (5000, 15000) range"):
    #     self.salary = salary
    #     self.message = message
    #     super().__init__(self.message)

    def __str__(self):
        return 'no devices/emulators found'

