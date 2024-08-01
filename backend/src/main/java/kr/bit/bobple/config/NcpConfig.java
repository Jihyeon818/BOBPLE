package kr.bit.bobple.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NcpConfig {

    @Value("${ncloud.object-storage.access-key}")
    private String accessKey;

    @Value("${ncloud.object-storage.secret-key}")
    private String secretKey;

    @Value("${ncloud.object-storage.endpoint}")
    private String endPoint;

    @Bean
    public AmazonS3 amazonS3() {
        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);

        return AmazonS3ClientBuilder
                .standard()
                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endPoint, ""))
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }
}
