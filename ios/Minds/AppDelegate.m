/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RNNotifications.h"
#import "AppDelegate.h"
#import "RNBootSplash.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSDictionary *initialProperties = arguments();
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Minds"
                                            initialProperties:initialProperties];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];

  [RNNotifications startMonitorNotifications];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

static NSDictionary *arguments()
{
    NSArray *arguments = [[NSProcessInfo processInfo] arguments];
    
    if(arguments.count < 2)
        return nil;
    
    NSMutableDictionary *argsDict = [[NSMutableDictionary alloc] init];
    
    NSMutableArray *args = [arguments mutableCopy];
    [args removeObjectAtIndex:0];
    
    NSInteger skip = 0;
    for(NSString *arg in args)
    {
        if(skip > 0 && ((NSInteger)[arguments indexOfObject:arg]) == skip)
        {
            continue;
        }
        else
        {
            if([arg rangeOfString:@"="].location != NSNotFound && [arg rangeOfString:@"--"].location != NSNotFound)
            {
                NSArray *components = [arg componentsSeparatedByString:@"="];
                NSString *key       = [[components objectAtIndex:0] stringByReplacingOccurrencesOfString:@"--" withString:@""];
                NSString *value     = [components objectAtIndex:1];
                
                [argsDict setObject:value forKey:key];
            }
            else if([arg rangeOfString:@"-"].location != NSNotFound)
            {
                NSInteger index = [arguments indexOfObject:arg];
                NSInteger next  = index + 1;
                NSString *key   = [arg stringByReplacingOccurrencesOfString:@"-" withString:@""];
                NSString *value = [arguments objectAtIndex:next];
                
                [argsDict setObject:value forKey:key];
            }
        }
    }
    
    NSLog(@"ARGS: %@", argsDict);
    
    return [argsDict copy];
}

@end
