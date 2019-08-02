debug-android:
	mkdir -p android/app/src/main/assets
	yarn bundle-android
	cd android && ./gradlew assembleDebug && cd ..
	cp android/app/build/outputs/apk/debug/app-debug.apk .

debug-ios:
	yarn bundle-ios
	fastlane ios test_build

beta-ios:
	yarn bundle-ios
	fastlane ios beta

beta-android:
	mkdir -p android/app/src/main/assets
	yarn bundle-android
	rm -rf android/app/src/main/res/drawable-*
	fastlane android beta
