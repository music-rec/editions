import MockDate from 'mockdate';
import { Level, Logging } from '../logging';

MockDate.set('2019-08-21');

describe('logging service - Offline', () => {
	describe('log', () => {
		it('should save queued logs when there is no internet connection', async () => {
			const loggingService = new Logging();
			loggingService.getExternalInfo = jest.fn().mockReturnValue({
				networkStatus: { type: 'wifi' },
				userData: {
					userDetails: { id: 'testId' },
					membershipData: {
						contentAccess: { digitalPack: true },
					},
				},
				casCode: 'QWERTYUIOP',
				iapReceipt: true,
			});
			loggingService.saveQueuedItems = jest.fn();
			loggingService.hasConsent = true;
			loggingService.enabled = true;
			await loggingService.log({ level: Level.INFO, message: 'test' });
			expect(loggingService.saveQueuedItems).toHaveBeenCalled();
		});
	});
});
